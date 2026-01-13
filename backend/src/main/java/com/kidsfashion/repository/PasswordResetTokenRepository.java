package com.kidsfashion.repository;

import com.kidsfashion.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUserIdAndUsedAtIsNull(Long userId);

    // Delete expired tokens
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);

    // Delete all tokens for user
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    // Check if user has valid token
    @Query("SELECT COUNT(t) > 0 FROM PasswordResetToken t WHERE t.user.id = :userId AND t.expiresAt > :now AND t.usedAt IS NULL")
    boolean hasValidToken(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}

