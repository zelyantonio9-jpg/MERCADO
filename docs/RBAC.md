# RBAC — AO MARKET

## Modelo

```
User —< UserRole >— Role —< RolePermission >— Permission
```

Um utilizador pode ter vários papéis (ex: um produtor que também compra).
Cada papel agrega um conjunto de permissões. O token JWT emitido no login
contém a lista de permissões já resolvida, para evitar consultas repetidas
à base de dados em cada pedido.

## Papéis definidos no seed inicial

| Papel          | Descrição                                          |
|----------------|-----------------------------------------------------|
| BUYER          | Comprador individual ou empresarial                  |
| PRODUCER       | Produtor/vendedor de produtos                        |
| TRANSPORTER    | Transportador                                        |
| COMPANY_ADMIN  | Administrador de uma empresa (aprovações, gestão)    |
| ADMIN          | Administração da plataforma                          |
| SUPPORT        | Suporte ao cliente                                   |

## Permissões do comprador (Fase atual)

```
buyer.profile.read
buyer.profile.update
addresses.create / .read / .update / .delete
cart.read / .create / .update
orders.create / .read / .cancel
payments.read
delivery.read / .confirm
chat.read / .send
reviews.create
documents.read
favorites.manage
```

## Regra de ownership

Toda a query que devolve dados do comprador (pedidos, pagamentos, endereços,
favoritos, avaliações, conversas, documentos) é filtrada no service por
`userId: req.user.id`. Nunca por um `userId` vindo do corpo ou da query
string do pedido.

Para empresas, adiciona-se `companyId: req.user.companyId`, garantindo que
uma empresa nunca acede a dados de outra (multi-tenancy).

## Testes de segurança obrigatórios (ver Fase 10 do workflow)

- Comprador A a aceder ao pedido do Comprador B → 403
- Comprador a tentar editar produto de um produtor → 403
- Empresa A a aceder a pedido da Empresa B → 403
- Utilizador sem `company.orders.approve` a tentar aprovar pedido → 403
