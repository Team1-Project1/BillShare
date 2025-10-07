package vn.backend.backend.service;

import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(Long groupId, Long userId, ActionType actionType, EntityType entityType, Long entityId);
    List<TransactionResponse> getTransactionsByGroupId(Long groupId);
    List<TransactionResponse> getTransactionsByUserId(Long userId);
}
