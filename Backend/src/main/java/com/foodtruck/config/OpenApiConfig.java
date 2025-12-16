package com.foodtruck.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configuração do Swagger / OpenAPI da aplicação
@Configuration
public class OpenApiConfig {

  // Define a documentação da API Foodtruck
  @Bean
  public OpenAPI foodtruckOpenAPI() {

    // Nome do esquema de segurança usado na API
    final String schemeName = "bearerAuth";

    return new OpenAPI()
        // Informações básicas da API
        .info(new Info()
                .title("Foodtruck API")
                .version("v1"))

        // Configura o esquema de autenticação JWT
        .components(new Components().addSecuritySchemes(
            schemeName,
            new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
        ))

        // Aplica a autenticação JWT globalmente na API
        .addSecurityItem(
            new SecurityRequirement().addList(schemeName)
        );
  }
}
