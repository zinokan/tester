package com.zenni.dating.service;

import com.zenni.dating.dto.UserRegistrationRequest;
import com.zenni.dating.dto.UserResponse;
import com.zenni.dating.model.Gender;
import com.zenni.dating.model.User;
import com.zenni.dating.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse registerUser(UserRegistrationRequest request) {
        // Check if user already exists
        if (userRepository.existsByFirebaseUid(request.getFirebaseUid())) {
            throw new RuntimeException("User with this Firebase UID already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }
        
        // Create new user
        User user = new User(
            request.getFirebaseUid(),
            request.getEmail(),
            request.getFirstName(),
            request.getLastName(),
            request.getDateOfBirth(),
            request.getGender(),
            request.getLookingForGender()
        );
        
        // Set additional fields
        user.setMinAge(request.getMinAge());
        user.setMaxAge(request.getMaxAge());
        user.setMaxDistance(request.getMaxDistance());
        user.setBio(request.getBio());
        user.setJob(request.getJob());
        user.setEducation(request.getEducation());
        user.setLocation(request.getLocation());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        
        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }
    
    public UserResponse getUserByFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }
    
    public UserResponse updateUser(Long id, UserRegistrationRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setLookingForGender(request.getLookingForGender());
        user.setMinAge(request.getMinAge());
        user.setMaxAge(request.getMaxAge());
        user.setMaxDistance(request.getMaxDistance());
        user.setBio(request.getBio());
        user.setJob(request.getJob());
        user.setEducation(request.getEducation());
        user.setLocation(request.getLocation());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        
        User updatedUser = userRepository.save(user);
        return convertToUserResponse(updatedUser);
    }
    
    public List<UserResponse> getPotentialMatches(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<User> potentialMatches;
        
        if (user.getLatitude() != null && user.getLongitude() != null) {
            potentialMatches = userRepository.findPotentialMatchesWithLocation(
                userId,
                user.getLookingForGender(),
                user.getGender(),
                user.getAge(),
                user.getLatitude(),
                user.getLongitude(),
                user.getMaxDistance()
            );
        } else {
            potentialMatches = userRepository.findPotentialMatches(
                userId,
                user.getLookingForGender(),
                user.getGender(),
                user.getAge()
            );
        }
        
        return potentialMatches.stream()
            .map(this::convertToUserResponse)
            .collect(Collectors.toList());
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAge(user.getAge());
        response.setGender(user.getGender());
        response.setLookingForGender(user.getLookingForGender());
        response.setMinAge(user.getMinAge());
        response.setMaxAge(user.getMaxAge());
        response.setMaxDistance(user.getMaxDistance());
        response.setBio(user.getBio());
        response.setJob(user.getJob());
        response.setEducation(user.getEducation());
        response.setLocation(user.getLocation());
        response.setLatitude(user.getLatitude());
        response.setLongitude(user.getLongitude());
        response.setSubscriptionTier(user.getSubscriptionTier());
        response.setIsVerified(user.getIsVerified());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        // Convert photos
        if (user.getPhotos() != null) {
            response.setPhotos(user.getPhotos().stream()
                .map(photo -> new com.zenni.dating.dto.PhotoResponse(
                    photo.getId(),
                    photo.getUrl(),
                    photo.getCaption(),
                    photo.getOrderIndex(),
                    photo.getIsVerified(),
                    photo.getIsMain(),
                    photo.getCreatedAt()
                ))
                .collect(Collectors.toList()));
        }
        
        // Convert interests
        if (user.getInterests() != null) {
            response.setInterests(user.getInterests().stream()
                .map(interest -> new com.zenni.dating.dto.InterestResponse(
                    interest.getId(),
                    interest.getName(),
                    interest.getType(),
                    interest.getCreatedAt()
                ))
                .collect(Collectors.toList()));
        }
        
        return response;
    }
}