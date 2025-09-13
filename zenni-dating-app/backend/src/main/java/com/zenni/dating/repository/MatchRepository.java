package com.zenni.dating.repository;

import com.zenni.dating.model.Match;
import com.zenni.dating.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    @Query("SELECT m FROM Match m WHERE (m.user1 = :user1 AND m.user2 = :user2) OR (m.user1 = :user2 AND m.user2 = :user1)")
    Optional<Match> findMatchBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    @Query("SELECT m FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) AND m.isActive = true")
    List<Match> findActiveMatchesForUser(@Param("user") User user);
    
    @Query("SELECT m FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) AND m.isActive = true ORDER BY m.lastMessageAt DESC NULLS LAST, m.createdAt DESC")
    List<Match> findActiveMatchesForUserOrderedByLastMessage(@Param("user") User user);
    
    @Query("SELECT m FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) AND m.isActive = true AND m.lastMessageAt IS NOT NULL ORDER BY m.lastMessageAt DESC")
    List<Match> findMatchesWithMessagesForUser(@Param("user") User user);
    
    @Query("SELECT m FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) AND m.isActive = true AND m.lastMessageAt IS NULL ORDER BY m.createdAt DESC")
    List<Match> findNewMatchesForUser(@Param("user") User user);
    
    long countByUser1AndIsActive(User user, Boolean isActive);
    
    long countByUser2AndIsActive(User user, Boolean isActive);
    
    @Query("SELECT COUNT(m) FROM Match m WHERE (m.user1 = :user OR m.user2 = :user) AND m.isActive = true")
    long countActiveMatchesForUser(@Param("user") User user);
}