package com.foodtruck.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI foodtruckOpenAPI() {
    final String schemeName = "bearerAuth";
    return new OpenAPI()
        .info(new Info().title("Foodtruck API").version("v1"))
        .components(new Components().addSecuritySchemes(
            schemeName,
            new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
        ))
        // 🔒 aplica o bearer por padrão nas operações
        .addSecurityItem(new SecurityRequirement().addList(schemeName));
  }
}
