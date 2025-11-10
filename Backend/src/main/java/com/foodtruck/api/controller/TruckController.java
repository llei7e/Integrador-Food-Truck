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

@RestController
@RequestMapping("/api/trucks")
@RequiredArgsConstructor
@Validated
public class TruckController {

    private final TruckService truckService;

    public record TruckCreateDto(
        @NotBlank String localizacao,
        Boolean ativo
    ) {}

    @PostMapping
    public ResponseEntity<Truck> criar(@RequestBody @Validated TruckCreateDto dto) {
        Truck t = truckService.criar(dto.localizacao(), dto.ativo());
        return ResponseEntity.status(HttpStatus.CREATED).body(t);
    }

    @GetMapping
    public List<Truck> listar() {
        return truckService.listarAtivos();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!truckService.existe(id)) return ResponseEntity.notFound().build();
        truckService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
