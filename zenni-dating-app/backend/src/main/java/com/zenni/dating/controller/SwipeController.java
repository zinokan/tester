package com.zenni.dating.controller;

import com.zenni.dating.dto.SwipeRequest;
import com.zenni.dating.model.Swipe;
import com.zenni.dating.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/swipe")
@CrossOrigin(origins = "*")
public class SwipeController {
    
    @Autowired
    private MatchingService matchingService;
    
    @PostMapping("/{swiperId}")
    public ResponseEntity<Swipe> processSwipe(@PathVariable Long swiperId, 
                                             @Valid @RequestBody SwipeRequest request) {
        try {
            Swipe swipe = matchingService.processSwipe(swiperId, request);
            return ResponseEntity.ok(swipe);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }
    
    @GetMapping("/count/{userId}/{type}")
    public ResponseEntity<Long> getSwipeCount(@PathVariable Long userId, 
                                             @PathVariable String type) {
        try {
            com.zenni.dating.model.SwipeType swipeType = com.zenni.dating.model.SwipeType.valueOf(type.toUpperCase());
            long count = matchingService.getDailySwipeCount(userId, swipeType);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(400).build();
        }
    }
}