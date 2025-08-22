package com.examly.springapp.service;

import com.examly.springapp.model.Inventory;
import com.examly.springapp.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public Inventory addInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public Inventory updateInventory(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId);
        if (inventory != null) {
            inventory.setQuantity(quantity);
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }
}
