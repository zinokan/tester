package com.zenni.dating.repository;

import com.zenni.dating.model.Match;
import com.zenni.dating.model.Message;
import com.zenni.dating.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Page<Message> findByMatchOrderByCreatedAtDesc(Match match, Pageable pageable);
    
    List<Message> findByMatchOrderByCreatedAtAsc(Match match);
    
    @Query("SELECT m FROM Message m WHERE m.match = :match AND m.sender != :user AND m.isRead = false")
    List<Message> findUnreadMessagesForUserInMatch(@Param("match") Match match, @Param("user") User user);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.match = :match AND m.sender != :user AND m.isRead = false")
    long countUnreadMessagesForUserInMatch(@Param("match") Match match, @Param("user") User user);
    
    @Query("SELECT m FROM Message m WHERE m.match = :match AND m.sender != :user AND m.isRead = false ORDER BY m.createdAt ASC")
    List<Message> findUnreadMessagesForUserInMatchOrdered(@Param("match") Match match, @Param("user") User user);
    
    @Query("SELECT m FROM Message m WHERE m.match IN (SELECT ma FROM Match ma WHERE ma.user1 = :user OR ma.user2 = :user) AND m.sender != :user AND m.isRead = false")
    List<Message> findAllUnreadMessagesForUser(@Param("user") User user);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.match IN (SELECT ma FROM Match ma WHERE ma.user1 = :user OR ma.user2 = :user) AND m.sender != :user AND m.isRead = false")
    long countAllUnreadMessagesForUser(@Param("user") User user);
    
    @Query("SELECT m FROM Message m WHERE m.match = :match AND m.createdAt > :since ORDER BY m.createdAt ASC")
    List<Message> findMessagesSince(@Param("match") Match match, @Param("since") LocalDateTime since);
    
    @Query("SELECT m FROM Message m WHERE m.match = :match ORDER BY m.createdAt DESC")
    Message findLatestMessageInMatch(@Param("match") Match match);
}