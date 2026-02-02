package at.mymove.video.application;

import java.io.InputStream;

public interface VideoStorage {

    String store(String videoId, InputStream data) throws Exception;

    void delete(String storageRef) throws Exception;
}