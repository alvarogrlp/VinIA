package com.vinia.backend.config;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UsuarioRepository usuarioRepository) {
        return args -> {
            // Check if admin exists
            if (usuarioRepository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword("admin");
                admin.setNombre("Administrador");
                admin.setApellidos("Sistema");
                admin.setRol("Administración");
                admin.setActivo(true);
                usuarioRepository.save(admin);
                System.out.println("Admin user created: admin/admin");
            }

            // Check if comercial exists
            if (usuarioRepository.findByUsername("comercial").isEmpty()) {
                Usuario comercial = new Usuario();
                comercial.setUsername("comercial");
                comercial.setPassword("comercial");
                comercial.setNombre("Juan");
                comercial.setApellidos("Comercial");
                comercial.setRol("Comercial");
                comercial.setActivo(true);
                usuarioRepository.save(comercial);
                System.out.println("Comercial user created: comercial/comercial");
            }
        };
    }
}
