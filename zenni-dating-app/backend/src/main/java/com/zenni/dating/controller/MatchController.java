package com.zenni.dating.controller;

import com.zenni.dating.dto.MatchResponse;
import com.zenni.dating.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matches")
@CrossOrigin(origins = "*")
public class MatchController {
    
    @Autowired
    private MatchingService matchingService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MatchResponse>> getMatchesForUser(@PathVariable Long userId) {
        try {
            List<MatchResponse> matches = matchingService.getMatchesForUser(userId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/{matchId}/user/{userId}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable Long matchId, 
                                                     @PathVariable Long userId) {
        try {
            MatchResponse match = matchingService.getMatchById(matchId, userId);
            return ResponseEntity.ok(match);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @DeleteMapping("/{matchId}/user/{userId}")
    public ResponseEntity<Void> unmatch(@PathVariable Long matchId, 
                                       @PathVariable Long userId) {
        try {
            matchingService.unmatch(matchId, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
}