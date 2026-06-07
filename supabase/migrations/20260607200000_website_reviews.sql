/*
  # Converter avaliações de utilizador para avaliações do website

  A tabela `avaliacoes` passa a guardar opiniões sobre o próprio website
  em vez de avaliações entre utilizadores.

  Alterações:
  1. Remover a constraint que proibia auto-avaliação (id_autor != id_alvo)
     — agora id_alvo = id_autor para indicar uma avaliação do website
  2. Remover o UNIQUE(id_autor, id_alvo) antigo
  3. Adicionar UNIQUE(id_autor) — cada utilizador só pode avaliar uma vez
*/

-- Remover constraints antigas (nomes gerados automaticamente pelo PostgreSQL)
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_id_autor_id_alvo_key;
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_check;

-- Apagar avaliações existentes (eram user-to-user, já não fazem sentido)
-- Remover esta linha se preferires manter registos antigos
TRUNCATE TABLE avaliacoes;

-- Nova constraint: um utilizador só pode avaliar o website uma vez
ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_unique_autor UNIQUE(id_autor);
