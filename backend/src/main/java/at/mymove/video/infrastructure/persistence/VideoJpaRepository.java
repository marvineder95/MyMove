package at.mymove.video.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface VideoJpaRepository extends JpaRepository<VideoJpaEntity, UUID> {
}