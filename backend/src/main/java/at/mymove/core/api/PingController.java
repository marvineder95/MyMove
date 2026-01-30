package at.mymove.core.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PingController {

    @GetMapping(ApiPaths.API_V1 + "/ping")
    public Map<String, String> ping() {
        return Map.of("status", "ok");
    }

    @GetMapping(ApiPaths.API_V1 + "/ping/error")
    public Map<String, String> error() {
        throw new IllegalArgumentException("boom");
    }
}