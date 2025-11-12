    package vn.backend.backend.service.Impl;

    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import vn.backend.backend.model.ExpenseParticipantEntity;
    import vn.backend.backend.repository.ExpenseParticipantRepository;
    import vn.backend.backend.repository.ExpenseRepository;
    import vn.backend.backend.repository.UserRepository;
    import vn.backend.backend.service.ExpenseParticipantService;

    import java.math.BigDecimal;
    import java.util.Date;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class ExpenseParticipantServiceImpl implements ExpenseParticipantService {
        private final ExpenseParticipantRepository participantRepository;
        private final ExpenseRepository expenseRepository;
        private final UserRepository userRepository;

        @Override
        public ExpenseParticipantEntity addParticipant(Long expenseId, Long userId, BigDecimal shareAmount) {
            var expense = expenseRepository.findByExpenseIdAndDeletedAtIsNull(expenseId)
                    .orElseThrow(() -> new RuntimeException("Expense not found or has been deleted"));
            var user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return participantRepository.save(ExpenseParticipantEntity.builder()
                    .expense(expense)
                    .user(user)
                    .shareAmount(shareAmount)
                    .build());
        }

//        @Override
//        public void removeAllParticipantsByExpenseId(Long expenseId) {
//            participantRepository.deleteAllByExpenseExpenseId(expenseId);
//        }

        @Override
        public List<ExpenseParticipantEntity> getParticipantsByExpenseId(Long expenseId) {
            return participantRepository.findAllByExpenseExpenseIdAndExpenseDeletedAtIsNull(expenseId);
        }

//        @Override
//        public List<ExpenseParticipantEntity> getParticipantsByUserId(Long userId) {
//            return participantRepository.findAllByUserUserIdAndExpenseDeletedAtIsNull(userId);
//        }

//        @Override
//        public void updateParticipantShare(Long participantId, BigDecimal newShareAmount) {
//            var participant = participantRepository.findByParticipantIdAndExpenseDeletedAtIsNull(participantId)
//                    .orElseThrow(() -> new RuntimeException("Participant not found"));
//
//            participant.setShareAmount(newShareAmount);
//            participantRepository.save(participant);
//        }
    }
