package com.zenni.dating.service;

import com.zenni.dating.dto.MatchResponse;
import com.zenni.dating.dto.SwipeRequest;
import com.zenni.dating.model.Match;
import com.zenni.dating.model.Swipe;
import com.zenni.dating.model.SwipeType;
import com.zenni.dating.model.User;
import com.zenni.dating.repository.MatchRepository;
import com.zenni.dating.repository.SwipeRepository;
import com.zenni.dating.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MatchingService {
    
    @Autowired
    private SwipeRepository swipeRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    public Swipe processSwipe(Long swiperId, SwipeRequest request) {
        User swiper = userRepository.findById(swiperId)
            .orElseThrow(() -> new RuntimeException("Swiper not found"));
        
        User swiped = userRepository.findById(request.getSwipedUserId())
            .orElseThrow(() -> new RuntimeException("Swiped user not found"));
        
        // Check if swipe already exists
        Optional<Swipe> existingSwipe = swipeRepository.findSwipeBetweenUsers(swiper, swiped);
        if (existingSwipe.isPresent()) {
            throw new RuntimeException("Swipe already exists between these users");
        }
        
        // Check daily limits for free users
        if (swiper.getSubscriptionTier().equals(com.zenni.dating.model.SubscriptionTier.FREE)) {
            long likesToday = swipeRepository.countSwipesTodayByUserAndType(swiper, SwipeType.LIKE);
            long superLikesToday = swipeRepository.countSwipesTodayByUserAndType(swiper, SwipeType.SUPER_LIKE);
            
            if (request.getType() == SwipeType.LIKE && likesToday >= 10) {
                throw new RuntimeException("Daily like limit reached for free users");
            }
            
            if (request.getType() == SwipeType.SUPER_LIKE && superLikesToday >= 1) {
                throw new RuntimeException("Daily super like limit reached for free users");
            }
        }
        
        // Create swipe
        Swipe swipe = new Swipe(swiper, swiped, request.getType());
        Swipe savedSwipe = swipeRepository.save(swipe);
        
        // Check for mutual like/match
        if (request.getType() == SwipeType.LIKE || request.getType() == SwipeType.SUPER_LIKE) {
            checkForMatch(swiper, swiped);
        }
        
        return savedSwipe;
    }
    
    private void checkForMatch(User swiper, User swiped) {
        // Check if the swiped user has also liked the swiper
        Optional<Swipe> mutualSwipe = swipeRepository.findSwipeBetweenUsers(swiped, swiper);
        
        if (mutualSwipe.isPresent() && 
            (mutualSwipe.get().getType() == SwipeType.LIKE || 
             mutualSwipe.get().getType() == SwipeType.SUPER_LIKE)) {
            
            // Check if match already exists
            Optional<Match> existingMatch = matchRepository.findMatchBetweenUsers(swiper, swiped);
            if (existingMatch.isEmpty()) {
                // Create new match
                Match match = new Match(swiper, swiped);
                matchRepository.save(match);
                
                // TODO: Send push notification to both users
                // TODO: Send WebSocket notification for real-time updates
            }
        }
    }
    
    public List<MatchResponse> getMatchesForUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Match> matches = matchRepository.findActiveMatchesForUserOrderedByLastMessage(user);
        
        return matches.stream()
            .map(match -> {
                MatchResponse response = new MatchResponse();
                response.setId(match.getId());
                response.setUser1(userService.convertToUserResponse(match.getUser1()));
                response.setUser2(userService.convertToUserResponse(match.getUser2()));
                response.setIsActive(match.getIsActive());
                response.setLastMessageAt(match.getLastMessageAt());
                response.setCreatedAt(match.getCreatedAt());
                response.setUpdatedAt(match.getUpdatedAt());
                return response;
            })
            .collect(Collectors.toList());
    }
    
    public MatchResponse getMatchById(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        MatchResponse response = new MatchResponse();
        response.setId(match.getId());
        response.setUser1(userService.convertToUserResponse(match.getUser1()));
        response.setUser2(userService.convertToUserResponse(match.getUser2()));
        response.setIsActive(match.getIsActive());
        response.setLastMessageAt(match.getLastMessageAt());
        response.setCreatedAt(match.getCreatedAt());
        response.setUpdatedAt(match.getUpdatedAt());
        
        return response;
    }
    
    public void unmatch(Long matchId, Long userId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        
        // Verify user is part of this match
        if (!match.getUser1().getId().equals(userId) && !match.getUser2().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this match");
        }
        
        match.setIsActive(false);
        matchRepository.save(match);
    }
    
    public long getDailySwipeCount(Long userId, SwipeType type) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return swipeRepository.countSwipesTodayByUserAndType(user, type);
    }
    
    public long getTotalSwipeCount(Long userId, SwipeType type) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return swipeRepository.countBySwiperAndType(user, type);
    }
}