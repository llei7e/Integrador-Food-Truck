package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Truck;
import com.foodtruck.domain.repo.TruckRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TruckService {

    private final TruckRepository truckRepo;

    public Truck criar(@NotBlank String localizacao, Boolean ativo) {
        Truck t = new Truck();
        t.setLocalizacao(localizacao);
        t.setAtivo(ativo == null ? true : ativo);
        return truckRepo.save(t);
    }

    public List<Truck> listarAtivos() {
        return truckRepo.findByAtivoTrue();
    }

    public boolean existe(Long id) {
        return truckRepo.existsById(id);
    }

    public void deletar(Long id) {
        truckRepo.deleteById(id);
    }
}
