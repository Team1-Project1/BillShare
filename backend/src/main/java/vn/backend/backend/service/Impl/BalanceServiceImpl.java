package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.model.BalanceEntity;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.model.PaymentEntity;
import vn.backend.backend.repository.BalanceRepository;
import vn.backend.backend.repository.ExpenseParticipantRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.controller.response.BalanceResponse;
import vn.backend.backend.service.BalanceService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final BalanceRepository balanceRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;

    @Override
    public BalanceEntity createBalance(Long groupId, Long userId1, Long userId2, BigDecimal amount) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        var user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        var user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        return balanceRepository.save(BalanceEntity.builder()
                .group(group)
                .user1(user1)
                .user2(user2)
                .balance(amount)
                .build());
    }

    private void updateOrCreateBalance(Long groupId, Long userId1, Long userId2, BigDecimal amount) {
        // Đảm bảo user_id_1 < user_id_2 (LEAST/GREATEST)
        Long smallerId = Math.min(userId1, userId2);
        Long largerId = Math.max(userId1, userId2);

        // Tìm balance với thứ tự đúng
        BalanceEntity balance = balanceRepository
                .findByGroupGroupIdAndUser1UserIdAndUser2UserId(groupId, smallerId, largerId)
                .orElse(null);

        if (balance != null) {
            // Cập nhật balance hiện có
            BigDecimal newBalance;

            if (userId1.equals(smallerId)) {
                // userId1 là user nhỏ hơn (user_id_1)
                // userId1 nợ userId2 → balance tăng
                newBalance = balance.getBalance().add(amount);
            } else {
                // userId1 là user lớn hơn (user_id_2)
                // userId2 nợ userId1 → balance giảm
                newBalance = balance.getBalance().subtract(amount);
            }

            balance.setBalance(newBalance);
            balanceRepository.save(balance);
        } else {
            // Tạo balance mới
            createNewBalance(groupId, smallerId, largerId, userId1, amount);
        }
    }
    @Override
    public void rollBackBalance(ExpenseEntity expense,Long oldPayerId,List<ExpenseParticipantEntity>oldParticipants) {
        Long groupId=expense.getGroup().getGroupId();
        for(var participant:oldParticipants) {
            if (participant.getUser().getUserId().equals(oldPayerId)) {
                continue;
            }
            Long participantUserId = participant.getUser().getUserId();
            BigDecimal shareAmount = participant.getShareAmount();
            Long smallerId = Math.min(participantUserId, oldPayerId);
            Long largerId = Math.max(participantUserId, oldPayerId);
            BalanceEntity balance = balanceRepository
                    .findByGroupGroupIdAndUser1UserIdAndUser2UserId(groupId, smallerId, largerId)
                    .orElseThrow(() -> new IllegalStateException("Balance record không tồn tại giữa user " + participantUserId
                            + " và payer " + oldPayerId + " trong nhóm " + groupId));
            if (balance.getUser1().getUserId().equals(participantUserId)) {
                balance.setBalance(balance.getBalance().subtract(shareAmount));
                balanceRepository.save(balance);
            } else {
                balance.setBalance(balance.getBalance().add(shareAmount));
                balanceRepository.save(balance);
            }
        }
    }

    @Override
    @Transactional
    public void updateBalancesForExpense(ExpenseEntity expense, List<ExpenseParticipantEntity> participants) {
        Long payerId = expense.getPayer().getUserId();
        Long groupId = expense.getGroup().getGroupId();

        for (ExpenseParticipantEntity participant : participants) {
            Long participantUserId = participant.getUser().getUserId();
            BigDecimal shareAmount = participant.getShareAmount();

            // Chỉ cập nhật balance cho những người không phải payer
            if (!participantUserId.equals(payerId)) {
                updateOrCreateBalance(groupId, participantUserId, payerId, shareAmount);
            }
        }
    }

    // In BalanceServiceImpl.java
    @Override
    @Transactional
    public void updateBalancesAfterExpenseDeletion(Long groupId, Long payerId, List<ExpenseParticipantEntity> participants) {

        for (ExpenseParticipantEntity participant : participants) {
            Long participantUserId = participant.getUser().getUserId();
            BigDecimal shareAmount = participant.getShareAmount();

            if (!participantUserId.equals(payerId)) {
                // Reverse the balance update: subtract shareAmount trừ ngược lại
                updateOrCreateBalance(groupId, participantUserId, payerId, shareAmount.negate());
            }
        }
    }


    private void createNewBalance(Long groupId, Long smallerId, Long largerId, Long debtorId, BigDecimal amount) {
        BalanceEntity newBalance = new BalanceEntity();
        newBalance.setGroup(groupRepository.getReferenceById(groupId));
        newBalance.setUser1(userRepository.getReferenceById(smallerId));
        newBalance.setUser2(userRepository.getReferenceById(largerId));

        // Xác định dấu của balance
        if (debtorId.equals(smallerId)) {
            // smallerId nợ largerId → balance dương
            newBalance.setBalance(amount);
        } else {
            // largerId nợ smallerId → balance âm
            newBalance.setBalance(amount.negate());
        }

        balanceRepository.save(newBalance);
    }
    @Override
    public BalanceEntity updateBalance(Long balanceId, BigDecimal newAmount) {
        var balance = balanceRepository.findById(balanceId)
                .orElseThrow(() -> new RuntimeException("Balance not found"));
        balance.setBalance(newAmount);
        return balanceRepository.save(balance);
    }

    @Override
    public List<BalanceEntity> getBalancesByGroupId(Long groupId) {
        return balanceRepository.findAllByGroupGroupId(groupId);
    }

    @Override
    public BalanceEntity getBalanceBetweenUsers(Long groupId, Long userId1, Long userId2) {
        return balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(groupId, userId1, userId2)
                .orElseThrow(() -> new RuntimeException("Balance not found"));
    }

    @Override
    public BalanceResponse getUserBalanceResponse(Long groupId, Long userId) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy toàn bộ balance trong group liên quan đến user
        List<BalanceEntity> balances = balanceRepository.findAllByGroupGroupId(groupId)
                .stream()
                .filter(b -> b.getUser1().getUserId().equals(userId) || b.getUser2().getUserId().equals(userId))
                .toList();

        List<BalanceResponse.UserBalanceDetail> details = balances.stream()
                .map(balance -> {
                    Long otherUserId;
                    String otherUserName;
                    BigDecimal amount;
                    Boolean isOwed;

                    // Xác định hướng nợ
                    if (balance.getUser1().getUserId().equals(userId)) {
                        // userId là user1
                        otherUserId = balance.getUser2().getUserId();
                        otherUserName = balance.getUser2().getFullName();
                        amount = balance.getBalance().abs();
                        isOwed = balance.getBalance().compareTo(BigDecimal.ZERO) < 0;
                    } else {
                        // userId là user2
                        otherUserId = balance.getUser1().getUserId();
                        otherUserName = balance.getUser1().getFullName();
                        amount = balance.getBalance().abs();
                        isOwed = balance.getBalance().compareTo(BigDecimal.ZERO) > 0;
                    }

                    return BalanceResponse.UserBalanceDetail.builder()
                            .userId(otherUserId)
                            .userName(otherUserName)
                            .amount(amount)
                            .isOwed(isOwed)
                            .build();
                })
                .toList();

        return BalanceResponse.builder()
                .userId(user.getUserId())
                .userName(user.getFullName())
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .balances(details)
                .build();
    }

    // =========================================================================
    // ==        THUẬT TOÁN TỐI ƯU HÓA NỢ BẰNG MAX-FLOW (EDMONDS-KARP)       ==
    // =========================================================================

    /**
     * Class đại diện cho một cạnh trong đồ thị flow network
     * Mỗi cạnh có:
     * - from, to: điểm đầu và điểm cuối (userId)
     * - capacity: dung lượng tối đa (số tiền có thể chuyển qua cạnh này)
     * - flow: lưu lượng hiện tại đang chảy qua cạnh
     * - reverse: tham chiếu đến cạnh ngược (cần thiết cho thuật toán max-flow)
     */
    private static class Edge {
        final Long from;        // userId nguồn
        final Long to;          // userId đích
        BigDecimal capacity;    // Dung lượng còn lại của cạnh (số tiền tối đa có thể chuyển)
        BigDecimal flow = BigDecimal.ZERO;  // Lưu lượng hiện tại
        Edge reverse;           // Cạnh ngược (quan trọng cho thuật toán Edmonds-Karp)

        Edge(Long from, Long to, BigDecimal capacity) {
            this.from = from;
            this.to = to;
            this.capacity = capacity;
        }

        /**
         * Tính dung lượng còn lại của cạnh (capacity - flow)
         */
        BigDecimal remaining() {
            return capacity.subtract(flow);
        }

        /**
         * Thêm lưu lượng vào cạnh này và trừ lưu lượng ở cạnh ngược
         * Đây là bước quan trọng trong thuật toán Edmonds-Karp
         */
        void addFlow(BigDecimal delta) {
            this.flow = this.flow.add(delta);
            this.reverse.flow = this.reverse.flow.subtract(delta);
        }
    }

    /**
     * Class đại diện cho đồ thị flow network
     * Sử dụng danh sách kề (adjacency list) để lưu trữ các cạnh
     * Triển khai thuật toán Edmonds-Karp (BFS-based max flow) với BigDecimal
     */
    private static class FlowGraph {
        final Map<Long, List<Edge>> adj = new HashMap<>();  // Danh sách kề
        final Set<Long> nodes = new HashSet<>();            // Tập các node (userId)

        /**
         * Thêm một cạnh có hướng từ u đến v với dung lượng cap
         * Đồng thời tạo cạnh ngược với dung lượng 0 (cần thiết cho max-flow)
         */
        void addEdge(Long u, Long v, BigDecimal cap) {
            nodes.add(u);
            nodes.add(v);
            adj.putIfAbsent(u, new ArrayList<>());
            adj.putIfAbsent(v, new ArrayList<>());

            // Tạo cạnh thuận (forward edge) với capacity = cap
            Edge f = new Edge(u, v, cap);
            // Tạo cạnh ngược (reverse edge) với capacity = 0
            Edge r = new Edge(v, u, BigDecimal.ZERO);

            // Liên kết 2 cạnh với nhau
            f.reverse = r;
            r.reverse = f;

            adj.get(u).add(f);
            adj.get(v).add(r);
        }

        /**
         * Tạo bản sao của FlowGraph
         * Chỉ copy các cạnh thuận (forward edges) có capacity > 0
         * Điều này đảm bảo cấu trúc đồ thị giống nhau và tránh duplicate cạnh ngược
         */
        static FlowGraph copyFrom(FlowGraph other) {
            FlowGraph g = new FlowGraph();

            // Copy tất cả các nodes
            for (Long n : other.nodes) {
                g.nodes.add(n);
                g.adj.putIfAbsent(n, new ArrayList<>());
            }

            // Copy các cạnh thuận (chỉ những cạnh có capacity > 0)
            for (Map.Entry<Long, List<Edge>> e : other.adj.entrySet()) {
                for (Edge edge : e.getValue()) {
                    // Chỉ copy cạnh thuận để tránh duplicate cạnh ngược
                    if (edge.capacity.compareTo(BigDecimal.ZERO) > 0) {
                        g.addEdge(edge.from, edge.to, edge.capacity);
                    }
                }
            }
            return g;
        }

        /**
         * Thuật toán Edmonds-Karp: tìm max flow từ source đến sink
         *
         * Ý tưởng:
         * 1. Sử dụng BFS để tìm đường đi ngắn nhất từ source đến sink
         * 2. Tìm bottleneck (giá trị nhỏ nhất) trên đường đi đó
         * 3. Tăng flow trên đường đi bằng bottleneck
         * 4. Lặp lại cho đến khi không còn đường đi nào
         *
         * @param source userId nguồn
         * @param sink userId đích
         * @return Tổng lưu lượng tối đa từ source đến sink
         */
        BigDecimal maxFlow(Long source, Long sink) {
            BigDecimal total = BigDecimal.ZERO;

            while (true) {
                // BƯỚC 1: Sử dụng BFS để tìm augmenting path (đường tăng luồng)
                Map<Long, Edge> parent = new HashMap<>();  // Lưu cạnh dẫn đến mỗi node
                Queue<Long> q = new LinkedList<>();
                q.add(source);
                Set<Long> seen = new HashSet<>();
                seen.add(source);

                // BFS
                while (!q.isEmpty()) {
                    Long u = q.poll();
                    if (u.equals(sink)) break;  // Đã đến đích

                    // Duyệt các cạnh kề
                    for (Edge e : adj.getOrDefault(u, Collections.emptyList())) {
                        // Chỉ đi qua cạnh chưa thăm và còn dung lượng
                        if (!seen.contains(e.to) && e.remaining().compareTo(BigDecimal.ZERO) > 0) {
                            parent.put(e.to, e);
                            seen.add(e.to);
                            q.add(e.to);
                        }
                    }
                }

                // Nếu không tìm được đường đi từ source đến sink -> dừng
                if (!parent.containsKey(sink)) break;

                // BƯỚC 2: Tìm bottleneck (dung lượng nhỏ nhất trên đường đi)
                BigDecimal bottleneck = null;
                for (Long v = sink; !v.equals(source); v = parent.get(v).from) {
                    Edge e = parent.get(v);
                    if (bottleneck == null) {
                        bottleneck = e.remaining();
                    } else {
                        bottleneck = bottleneck.min(e.remaining());
                    }
                }

                if (bottleneck == null) break;

                // BƯỚC 3: Tăng flow trên đường đi bằng bottleneck
                for (Long v = sink; !v.equals(source); v = parent.get(v).from) {
                    parent.get(v).addFlow(bottleneck);
                }

                total = total.add(bottleneck);
            }

            return total;
        }
    }

    /**
     * Record đại diện cho một khoản nợ
     * from: người nợ
     * to: người cho vay
     * amount: số tiền nợ
     */
    private record Debt(Long from, Long to, BigDecimal amount) {}

    /**
     * Xây dựng đồ thị flow network từ danh sách balance hiện tại
     *
     * Quy tắc chuyển đổi:
     * - Xét TẤT CẢ các cặp userId có trong bảng balance (kể cả balance = 0)
     * - Nếu balance > 0: user1 nợ user2 -> tạo cạnh user1 -> user2
     * - Nếu balance < 0: user2 nợ user1 -> tạo cạnh user2 -> user1
     * - Nếu balance = 0: tạo cạnh 2 chiều với capacity = 0 (để thuật toán có thể tìm đường đi qua)
     * - Capacity của cạnh = |balance|
     *
     * LƯU Ý: Balance = 0 vẫn được thêm vào đồ thị vì:
     * - Đây là các cặp đã từng có quan hệ nợ (tồn tại trong DB)
     * - Có thể tạo ra đường đi gián tiếp để tối ưu hóa
     * - Chỉ loại bỏ các cặp hoàn toàn không tồn tại trong bảng balance
     *
     * @param balances Danh sách balance entities (bao gồm cả balance = 0)
     * @return FlowGraph đại diện cho mạng nợ
     */
    private FlowGraph buildGraphFromBalances(List<BalanceEntity> balances) {
        FlowGraph g = new FlowGraph();

        for (BalanceEntity b : balances) {
            Long u1 = b.getUser1().getUserId();
            Long u2 = b.getUser2().getUserId();

            // Thêm cả 2 user vào đồ thị (để đảm bảo node tồn tại)
            g.nodes.add(u1);
            g.nodes.add(u2);

            if (b.getBalance().compareTo(BigDecimal.ZERO) > 0) {
                // balance > 0: user1 nợ user2
                g.addEdge(u1, u2, b.getBalance());
            } else if (b.getBalance().compareTo(BigDecimal.ZERO) < 0) {
                // balance < 0: user2 nợ user1
                g.addEdge(u2, u1, b.getBalance().abs());
            } else {
                // balance = 0: Tạo cạnh 2 chiều với capacity = 0
                // Mục đích: cho phép thuật toán tìm đường đi qua cặp này nếu cần
                // (vì đây là cặp đã từng có quan hệ nợ)
                g.addEdge(u1, u2, BigDecimal.ZERO);
                g.addEdge(u2, u1, BigDecimal.ZERO);
            }
        }

        return g;
    }

    /**
     * PHƯƠNG THỨC CHÍNH: Tối ưu hóa nợ bằng thuật toán Max-Flow với ràng buộc cạnh
     *
     * Ý TƯỞNG CHÍNH:
     * - Với mỗi cạnh nợ trực tiếp A -> B, tìm các đường đi gián tiếp A -> ... -> B
     * - Chuyển nợ qua đường gián tiếp này để giảm số lượng giao dịch
     * - Đảm bảo không tạo quan hệ nợ mới giữa những người không liên quan
     *
     * THUẬT TOÁN:
     * 1. Xây dựng đồ thị flow từ các balance hiện tại
     * 2. Với mỗi cạnh trực tiếp (u->v):
     *    a. Tạo bản sao đồ thị, đặt capacity cạnh u->v = 0
     *    b. Tìm max flow từ u đến v qua các đường khác
     *    c. Lượng flow tìm được sẽ được cộng vào cạnh trực tiếp u->v
     *    d. Trừ flow này khỏi các cạnh trung gian đã sử dụng
     * 3. Thu thập các cạnh còn lại (capacity > 0) làm kết quả
     *
     * ĐẢM BẢO:
     * - Không tạo quan hệ nợ mới giữa người không liên quan
     * - Tổng nợ của mỗi người không thay đổi
     * - Giảm số lượng giao dịch cần thiết
     *
     * @param groupId ID của nhóm
     * @param userId ID của user yêu cầu xem balance
     * @return BalanceResponse với danh sách nợ đã tối ưu
     */
    @Override
    public BalanceResponse getSimplifiedUserBalanceResponse(Long groupId, Long userId) {
        // Validate group và user
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));
        var requestingUser = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));

        // Lấy tất cả balance trong nhóm
        List<BalanceEntity> allBalances = balanceRepository.findAllByGroupGroupId(groupId);

        // Xây dựng đồ thị flow ban đầu
        FlowGraph mainGraph = buildGraphFromBalances(allBalances);

        // Tạo map lưu tên user để hiển thị
        Map<Long, String> userNames = new HashMap<>();
        for (BalanceEntity b : allBalances) {
            userNames.put(b.getUser1().getUserId(), b.getUser1().getFullName());
            userNames.put(b.getUser2().getUserId(), b.getUser2().getFullName());
        }

        // Thu thập tất cả các cạnh thuận ban đầu (snapshot)
        List<Debt> initialEdges = new ArrayList<>();
        for (Map.Entry<Long, List<Edge>> e : mainGraph.adj.entrySet()) {
            for (Edge edge : e.getValue()) {
                // Chỉ lấy các cạnh thuận (capacity > 0)
                if (edge.capacity.compareTo(BigDecimal.ZERO) >= 0) {
                    initialEdges.add(new Debt(edge.from, edge.to, edge.capacity));
                }
            }
        }

        // XỬ LÝ TỪ TỪNG CẠNH: Tìm đường đi gián tiếp để tối ưu
        for (Debt edge : initialEdges) {
            Long u = edge.from();
            Long v = edge.to();

            // Tạo bản sao đồ thị, loại bỏ cạnh trực tiếp u->v
            // Mục đích: buộc thuật toán phải tìm đường đi qua các node khác
            FlowGraph temp = FlowGraph.copyFrom(mainGraph);

            // Đặt capacity của cạnh trực tiếp u->v = 0 trong temp graph
            List<Edge> edgesFromU = temp.adj.getOrDefault(u, Collections.emptyList());
            for (Edge e : edgesFromU) {
                if (e.to.equals(v)) {
                    e.capacity = BigDecimal.ZERO;
                    break;
                }
            }

            // Tính max flow từ u đến v (qua các đường gián tiếp)
            BigDecimal flowFound = temp.maxFlow(u, v);
            if (flowFound.compareTo(BigDecimal.ZERO) <= 0) continue;  // Không tìm được đường nào

            // Trừ flow đã dùng khỏi các cạnh trung gian trong mainGraph
            for (Map.Entry<Long, List<Edge>> ent : temp.adj.entrySet()) {
                for (Edge usedEdge : ent.getValue()) {
                    // Chỉ xét các cạnh thuận đã được sử dụng (flow > 0)
                    if (usedEdge.flow.compareTo(BigDecimal.ZERO) > 0) {
                        // Tìm cạnh tương ứng trong mainGraph
                        Edge corresponding = mainGraph.adj.getOrDefault(usedEdge.from, Collections.emptyList())
                                .stream()
                                .filter(e2 -> e2.to.equals(usedEdge.to))
                                .findFirst()
                                .orElse(null);

                        if (corresponding != null) {
                            // Giảm capacity của cạnh trung gian
                            corresponding.capacity = corresponding.capacity.subtract(usedEdge.flow);
                        }
                    }
                }
            }

            // Tăng capacity của cạnh trực tiếp u->v trong mainGraph
            Edge directEdge = mainGraph.adj.getOrDefault(u, Collections.emptyList())
                    .stream()
                    .filter(e2 -> e2.to.equals(v))
                    .findFirst()
                    .orElse(null);

            if (directEdge != null) {
                directEdge.capacity = directEdge.capacity.add(flowFound);
            } else {
                // Trường hợp defensive (không nên xảy ra)
                mainGraph.addEdge(u, v, flowFound);
            }
        }

        // Thu thập các khoản nợ sau khi tối ưu (chỉ các cạnh có capacity > 0)
        List<Debt> simplified = new ArrayList<>();
        for (Map.Entry<Long, List<Edge>> e : mainGraph.adj.entrySet()) {
            for (Edge edge : e.getValue()) {
                if (edge.capacity.compareTo(BigDecimal.ZERO) > 0) {
                    simplified.add(new Debt(edge.from, edge.to, edge.capacity));
                }
            }
        }

        // Xây dựng response chỉ cho user yêu cầu
        List<BalanceResponse.UserBalanceDetail> details = simplified.stream()
                // Lọc các khoản nợ > 0 (làm tròn 2 chữ số)
                .filter(d -> d.amount().setScale(2, RoundingMode.HALF_UP).compareTo(BigDecimal.ZERO) > 0)
                // Chỉ lấy các khoản liên quan đến userId
                .filter(d -> d.from().equals(userId) || d.to().equals(userId))
                .map(d -> {
                    if (d.from().equals(userId)) {
                        // User đang nợ người khác
                        return BalanceResponse.UserBalanceDetail.builder()
                                .userId(d.to())
                                .userName(userNames.get(d.to()))
                                .amount(d.amount())
                                .isOwed(false)  // User phải trả nợ
                                .build();
                    } else {
                        // Người khác đang nợ user
                        return BalanceResponse.UserBalanceDetail.builder()
                                .userId(d.from())
                                .userName(userNames.get(d.from()))
                                .amount(d.amount())
                                .isOwed(true)  // User được nhận tiền
                                .build();
                    }
                })
                .collect(Collectors.toList());

        return BalanceResponse.builder()
                .userId(requestingUser.getUserId())
                .userName(requestingUser.getFullName())
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .balances(details)
                .build();
    }@Override
    @Transactional
    public void updateBalancesForPayment(PaymentEntity payment) {
        Long payerId = payment.getPayer().getUserId();
        Long payeeId = payment.getPayee().getUserId();
        Long groupId = payment.getGroup().getGroupId();
        BigDecimal amount = payment.getAmount();

        // Payment giảm nợ: payer trả tiền cho payee
        // Cần trừ số tiền khỏi balance giữa 2 người
        // Nếu payer đang nợ payee -> giảm nợ
        // Nếu payee đang nợ payer -> tăng nợ ngược lại (payee nợ ít hơn)
        updateOrCreateBalance(groupId, payerId, payeeId, amount.negate());
    }

    @Override
    @Transactional
    public void updateBalancesAfterPaymentDeletion(PaymentEntity payment) {
        Long payerId = payment.getPayer().getUserId();
        Long payeeId = payment.getPayee().getUserId();
        Long groupId = payment.getGroup().getGroupId();
        BigDecimal amount = payment.getAmount();

        // Rollback payment: hoàn tác việc trả nợ
        // Cộng lại số tiền vào balance
        updateOrCreateBalance(groupId, payerId, payeeId, amount);
    }
}
