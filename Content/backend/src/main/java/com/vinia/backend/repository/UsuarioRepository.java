package com.vinia.backend.repository;

import com.vinia.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByUsername(String username);

    List<Usuario> findByRolAndActivoTrue(String rol);
}
