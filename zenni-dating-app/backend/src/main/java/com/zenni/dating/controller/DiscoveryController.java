package com.zenni.dating.controller;

import com.zenni.dating.dto.UserResponse;
import com.zenni.dating.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discovery")
@CrossOrigin(origins = "*")
public class DiscoveryController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/matches/{userId}")
    public ResponseEntity<List<UserResponse>> getPotentialMatches(@PathVariable Long userId) {
        try {
            List<UserResponse> matches = userService.getPotentialMatches(userId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}