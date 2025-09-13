package com.zenni.dating.dto;

import com.zenni.dating.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MessageRequest {
    
    @NotNull(message = "Match ID is required")
    private Long matchId;
    
    @NotBlank(message = "Message content is required")
    private String content;
    
    @NotNull(message = "Message type is required")
    private MessageType type = MessageType.TEXT;
    
    private String attachmentUrl;
    
    // Constructors
    public MessageRequest() {}
    
    public MessageRequest(Long matchId, String content, MessageType type) {
        this.matchId = matchId;
        this.content = content;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
}