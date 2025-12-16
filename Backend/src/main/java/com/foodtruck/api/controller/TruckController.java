package com.foodtruck.api.controller;

import com.foodtruck.domain.model.Truck;
import com.foodtruck.domain.service.TruckService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller responsável pelo gerenciamento dos food trucks
@RestController
@RequestMapping("/api/trucks")
@RequiredArgsConstructor
@Validated
public class TruckController {

    // Serviço que contém a lógica de negócio dos trucks
    private final TruckService truckService;

    // DTO usado para criação de food trucks
    public record TruckCreateDto(
        @NotBlank String localizacao,   // Localização do truck
        Boolean ativo                   // Status do truck
    ) {}

    // Endpoint para criar um novo food truck
    @PostMapping
    public ResponseEntity<Truck> criar(@RequestBody @Validated TruckCreateDto dto) {
        // Cria o truck com base nos dados recebidos
        Truck t = truckService.criar(dto.localizacao(), dto.ativo());
        return ResponseEntity.status(HttpStatus.CREATED).body(t);
    }

    // Endpoint para listar apenas os trucks ativos
    @GetMapping
    public List<Truck> listar() {
        // Retorna todos os trucks ativos
        return truckService.listarAtivos();
    }

    // Endpoint para remover um truck pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        // Verifica se o truck existe antes de excluir
        if (!truckService.existe(id)) {
            return ResponseEntity.notFound().build();
        }

        truckService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
