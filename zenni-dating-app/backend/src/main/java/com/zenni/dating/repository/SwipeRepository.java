package com.zenni.dating.repository;

import com.zenni.dating.model.Swipe;
import com.zenni.dating.model.SwipeType;
import com.zenni.dating.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, Long> {
    
    Optional<Swipe> findBySwiperAndSwiped(User swiper, User swiped);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiper = :swiper AND s.swiped = :swiped")
    Optional<Swipe> findSwipeBetweenUsers(@Param("swiper") User swiper, @Param("swiped") User swiped);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiper = :user OR s.swiped = :user")
    List<Swipe> findAllSwipesForUser(@Param("user") User user);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiper = :user AND s.type = :type")
    List<Swipe> findSwipesByUserAndType(@Param("user") User user, @Param("type") SwipeType type);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiped = :user AND s.type = 'LIKE'")
    List<Swipe> findLikesReceivedByUser(@Param("user") User user);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiper = :user AND s.type = 'LIKE'")
    List<Swipe> findLikesGivenByUser(@Param("user") User user);
    
    @Query("SELECT s FROM Swipe s WHERE s.swiper = :user AND s.type = 'SUPER_LIKE'")
    List<Swipe> findSuperLikesGivenByUser(@Param("user") User user);
    
    long countBySwiperAndType(User swiper, SwipeType type);
    
    @Query("SELECT COUNT(s) FROM Swipe s WHERE s.swiper = :user AND s.type = :type AND DATE(s.createdAt) = CURRENT_DATE")
    long countSwipesTodayByUserAndType(@Param("user") User user, @Param("type") SwipeType type);
}