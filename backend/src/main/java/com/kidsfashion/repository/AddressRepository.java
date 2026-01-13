package com.kidsfashion.repository;

import com.kidsfashion.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByIsDefaultDesc(Long userId);

    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.id != :addressId")
    void clearDefaultForUser(@Param("userId") Long userId, @Param("addressId") Long addressId);

    int countByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}

