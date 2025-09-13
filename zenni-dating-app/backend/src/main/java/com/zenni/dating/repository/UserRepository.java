package com.zenni.dating.repository;

import com.zenni.dating.model.Gender;
import com.zenni.dating.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByFirebaseUid(String firebaseUid);
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.id != :userId " +
           "AND u.gender = :lookingForGender " +
           "AND u.lookingForGender = :userGender " +
           "AND u.minAge <= :userAge AND u.maxAge >= :userAge " +
           "AND u.id NOT IN (SELECT s.swiped.id FROM Swipe s WHERE s.swiper.id = :userId)")
    List<User> findPotentialMatches(@Param("userId") Long userId, 
                                   @Param("lookingForGender") Gender lookingForGender,
                                   @Param("userGender") Gender userGender,
                                   @Param("userAge") Integer userAge);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.id != :userId " +
           "AND u.gender = :lookingForGender " +
           "AND u.lookingForGender = :userGender " +
           "AND u.minAge <= :userAge AND u.maxAge >= :userAge " +
           "AND u.id NOT IN (SELECT s.swiped.id FROM Swipe s WHERE s.swiper.id = :userId) " +
           "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(u.latitude)))) <= :maxDistance")
    List<User> findPotentialMatchesWithLocation(@Param("userId") Long userId, 
                                               @Param("lookingForGender") Gender lookingForGender,
                                               @Param("userGender") Gender userGender,
                                               @Param("userAge") Integer userAge,
                                               @Param("latitude") Double latitude,
                                               @Param("longitude") Double longitude,
                                               @Param("maxDistance") Integer maxDistance);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.subscriptionTier != 'FREE'")
    List<User> findPremiumUsers();
    
    boolean existsByFirebaseUid(String firebaseUid);
    
    boolean existsByEmail(String email);
}