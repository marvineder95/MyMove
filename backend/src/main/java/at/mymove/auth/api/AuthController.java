package at.mymove.auth.api;

import at.mymove.auth.api.dto.RegisterCompanyRequest;
import at.mymove.auth.api.dto.RegisterCompanyResponse;
import at.mymove.auth.application.RegisterCompanyUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterCompanyUseCase registerCompanyUseCase;

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterCompanyResponse registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        return registerCompanyUseCase.execute(request);
    }

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }
}