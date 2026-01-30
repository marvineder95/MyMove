package at.mymove.video.infrastructure.persistence;

import at.mymove.video.application.VideoRepository;
import at.mymove.video.domain.Video;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class VideoRepositoryImpl implements VideoRepository {

    private final VideoJpaRepository jpa;

    @Override
    public Video save(Video video) {
        return VideoMapper.toDomain(jpa.save(VideoMapper.toJpa(video)));
    }

    @Override
    public Optional<Video> findById(UUID id) {
        return jpa.findById(id).map(VideoMapper::toDomain);
    }
}