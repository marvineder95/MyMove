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

    private final VideoJpaRepository videoJpaRepository;

    @Override
    public Video save(Video video) {
        var saved = videoJpaRepository.save(VideoMapper.toJpa(video));
        return VideoMapper.toDomain(saved);
    }

    @Override
    public Optional<Video> findById(UUID id) {
        return videoJpaRepository.findById(id).map(VideoMapper::toDomain);
    }

    @Override
    public void deleteById(UUID id) {
        videoJpaRepository.deleteById(id);
    }
}