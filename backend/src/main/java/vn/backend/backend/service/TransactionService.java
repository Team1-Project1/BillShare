package vn.backend.backend.service;

import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(Long groupId, Long userId, ActionType actionType, EntityType entityType, Long entityId);
    Page<TransactionResponse> getTransactionsByGroupId(Long userId,Long groupId, Pageable pageable);
    List<TransactionResponse> getTransactionsByUserId(Long userId);
}
