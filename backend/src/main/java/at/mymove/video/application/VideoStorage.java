package at.mymove.video.application;

import java.io.InputStream;

public interface VideoStorage {

    String store(String key, InputStream data);
}