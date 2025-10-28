package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.model.TransactionEntity;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.TransactionRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMembersRepository groupMembersRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(Long groupId, Long userId, ActionType actionType, EntityType entityType, Long entityId) {
        GroupEntity group = groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TransactionEntity transaction = TransactionEntity.builder()
                .group(group)
                .user(user)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .build();

        TransactionEntity savedTransaction = transactionRepository.save(transaction);
        return toResponse(savedTransaction);
    }

    @Override
    public Page<TransactionResponse> getTransactionsByGroupId(Long userId, Pageable pageable) {
        // Remove .map(this::toResponse) since repository returns TransactionResponse directly
        return transactionRepository.findTransactionsByUserActiveGroups(userId, pageable);
    }


    private TransactionResponse toResponse(TransactionEntity entity) {
        return TransactionResponse.builder()
                .transactionId(entity.getTransactionId())
                .groupId(entity.getGroup() != null ? entity.getGroup().getGroupId() : null)
                .groupName(entity.getGroup() != null ? entity.getGroup().getGroupName() : null)
                .userId(entity.getUser() != null ? entity.getUser().getUserId() : null)
                .userName(entity.getUser() != null ? entity.getUser().getFullName() : null)
                .actionType(entity.getActionType())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
