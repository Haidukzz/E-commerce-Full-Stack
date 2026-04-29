package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fornecedor")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(unique = true, length = 20)
    private String cnpj;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String telefone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;
}
