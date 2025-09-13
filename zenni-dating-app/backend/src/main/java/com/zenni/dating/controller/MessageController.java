package com.zenni.dating.controller;

import com.zenni.dating.dto.MessageRequest;
import com.zenni.dating.dto.MessageResponse;
import com.zenni.dating.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @PostMapping("/send/{senderId}")
    public ResponseEntity<MessageResponse> sendMessage(@PathVariable Long senderId, 
                                                      @Valid @RequestBody MessageRequest request) {
        try {
            MessageResponse message = messageService.sendMessage(senderId, request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }
    
    @GetMapping("/match/{matchId}/user/{userId}")
    public ResponseEntity<List<MessageResponse>> getMessagesForMatch(@PathVariable Long matchId, 
                                                                    @PathVariable Long userId,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "50") int size) {
        try {
            List<MessageResponse> messages = messageService.getMessagesForMatch(matchId, userId, page, size);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @GetMapping("/match/{matchId}/user/{userId}/all")
    public ResponseEntity<List<MessageResponse>> getAllMessagesForMatch(@PathVariable Long matchId, 
                                                                       @PathVariable Long userId) {
        try {
            List<MessageResponse> messages = messageService.getAllMessagesForMatch(matchId, userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @PostMapping("/match/{matchId}/user/{userId}/read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long matchId, 
                                                  @PathVariable Long userId) {
        try {
            messageService.markMessagesAsRead(matchId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @GetMapping("/unread/count/{userId}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable Long userId) {
        try {
            long count = messageService.getUnreadMessageCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @GetMapping("/match/{matchId}/user/{userId}/unread/count")
    public ResponseEntity<Long> getUnreadMessageCountForMatch(@PathVariable Long matchId, 
                                                             @PathVariable Long userId) {
        try {
            long count = messageService.getUnreadMessageCountForMatch(matchId, userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @GetMapping("/match/{matchId}/user/{userId}/since")
    public ResponseEntity<List<MessageResponse>> getMessagesSince(@PathVariable Long matchId, 
                                                                 @PathVariable Long userId,
                                                                 @RequestParam String since) {
        try {
            LocalDateTime sinceTime = LocalDateTime.parse(since);
            List<MessageResponse> messages = messageService.getMessagesSince(matchId, userId, sinceTime);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }
}