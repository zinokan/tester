package com.zenni.dating.service;

import com.zenni.dating.dto.MessageRequest;
import com.zenni.dating.dto.MessageResponse;
import com.zenni.dating.model.Match;
import com.zenni.dating.model.Message;
import com.zenni.dating.model.User;
import com.zenni.dating.repository.MatchRepository;
import com.zenni.dating.repository.MessageRepository;
import com.zenni.dating.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    public MessageResponse sendMessage(Long senderId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        Match match = matchRepository.findById(request.getMatchId())
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify sender is part of this match
        if (!match.getUser1().getId().equals(senderId) && !match.getUser2().getId().equals(senderId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        // Verify match is active
        if (!match.getIsActive()) {
            throw new RuntimeException("Match is not active");
        }
        
        // Create message
        Message message = new Message(match, sender, request.getContent(), request.getType());
        message.setAttachmentUrl(request.getAttachmentUrl());
        
        Message savedMessage = messageRepository.save(message);
        
        // Update match's last message timestamp
        match.setLastMessageAt(LocalDateTime.now());
        matchRepository.save(match);
        
        // TODO: Send WebSocket notification for real-time updates
        // TODO: Send push notification to the other user
        
        return convertToMessageResponse(savedMessage);
    }
    
    public List<MessageResponse> getMessagesForMatch(Long matchId, Long userId, int page, int size) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByMatchOrderByCreatedAtDesc(match, pageable);
        
        return messagePage.getContent().stream()
            .map(this::convertToMessageResponse)
            .collect(Collectors.toList());
    }
    
    public List<MessageResponse> getAllMessagesForMatch(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        List<Message> messages = messageRepository.findByMatchOrderByCreatedAtAsc(match);
        
        return messages.stream()
            .map(this::convertToMessageResponse)
            .collect(Collectors.toList());
    }
    
    public void markMessagesAsRead(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> unreadMessages = messageRepository.findUnreadMessagesForUserInMatchOrdered(match, user);
        
        for (Message message : unreadMessages) {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
        }
    }
    
    public long getUnreadMessageCount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.countAllUnreadMessagesForUser(user);
    }
    
    public long getUnreadMessageCountForMatch(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.countUnreadMessagesForUserInMatch(match, user);
    }
    
    public List<MessageResponse> getMessagesSince(Long matchId, Long userId, LocalDateTime since) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        List<Message> messages = messageRepository.findMessagesSince(match, since);
        
        return messages.stream()
            .map(this::convertToMessageResponse)
            .collect(Collectors.toList());
    }
    
    private MessageResponse convertToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setMatchId(message.getMatch().getId());
        response.setSender(userService.convertToUserResponse(message.getSender()));
        response.setContent(message.getContent());
        response.setType(message.getType());
        response.setAttachmentUrl(message.getAttachmentUrl());
        response.setIsRead(message.getIsRead());
        response.setReadAt(message.getReadAt());
        response.setCreatedAt(message.getCreatedAt());
        
        return response;
    }
}