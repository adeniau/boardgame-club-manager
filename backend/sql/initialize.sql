--
-- Base de données :  `---MYSQL_DATABASE---`
--
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `---MYSQL_DATABASE---` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
-- --------------------------------------------------------
use ---MYSQL_DATABASE---;

--
-- Structure de la table `memberships`
--

CREATE TABLE `memberships` (
  `id_member` int(11) NOT NULL,
  `id_season` int(11) NOT NULL,
  `deposit` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Structure de la table `borrowings`
--

CREATE TABLE `borrowings` (
  `id` int(11) NOT NULL,
  `id_season` int(11) NOT NULL,
  `id_member` int(11) NOT NULL,
  `id_game` int(11) NOT NULL,
  `borrow_date` varchar(10) COLLATE utf8_bin NOT NULL,
  `return_date` varchar(10) COLLATE utf8_bin DEFAULT NULL,
  `comment` text COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Structure de la table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8_bin NOT NULL,
  `picture` text COLLATE utf8_bin NOT NULL,
  `available` varchar(1) COLLATE utf8_bin NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Structure de la table `seasons`
--

CREATE TABLE `seasons` (
  `id` int(11) NOT NULL,
  `year` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Structure de la table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_bin NOT NULL,
  `firstname` varchar(50) COLLATE utf8_bin NOT NULL,
  `adress` text COLLATE utf8_bin NOT NULL,
  `postal_code` int(5) NOT NULL,
  `city` text COLLATE utf8_bin NOT NULL,
  `email` varchar(100) COLLATE utf8_bin NOT NULL,
  `birth_date` varchar(10) COLLATE utf8_bin NOT NULL,
  `phone_number` varchar(10) COLLATE utf8_bin NOT NULL,
  `picture` text COLLATE utf8_bin NOT NULL,
  `admin_password` text COLLATE utf8_bin NOT NULL,
  `discord_tag` varchar(50) COLLATE utf8_bin NOT NULL,
  `admin` varchar(1) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id_member`,`id_season`),
  ADD KEY `season_key` (`id_season`);

--
-- Index pour la table `borrowings`
--
ALTER TABLE `borrowings`
  ADD KEY `game_key` (`id_game`),
  ADD KEY `id_user` (`id_member`) USING BTREE;

ALTER TABLE `borrowings`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `firstname` (`firstname`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `seasons`
--
ALTER TABLE `seasons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `borrowings`
--
ALTER TABLE `borrowings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `memberships`
--
ALTER TABLE `memberships` ADD CONSTRAINT `season_key` FOREIGN KEY (`id_season`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;
ALTER TABLE `memberships` ADD CONSTRAINT `member_key` FOREIGN KEY (`id_member`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `borrowings`
--
ALTER TABLE `borrowings` ADD CONSTRAINT `season2_key` FOREIGN KEY (`id_season`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;
ALTER TABLE `borrowings` ADD CONSTRAINT `game_key` FOREIGN KEY (`id_game`) REFERENCES `games` (`id`) ON DELETE CASCADE;
ALTER TABLE `borrowings` ADD CONSTRAINT `member2_key` FOREIGN KEY (`id_member`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Vues
--
CREATE VIEW `current_borrowings` AS SELECT  b.id, b.id_season, b.borrow_date, m.name, m.firstname, m.picture, g.name AS game_name, g.picture AS game_picture FROM borrowings b, games g, members m WHERE b.id_game=g.id and b.id_member=m.id and b.return_date IS NULL ORDER BY b.borrow_date;
CREATE VIEW `random_game` AS SELECT FLOOR(MIN(a.id) + (RAND() * MAX(b.id-1))) AS random from games a, games b;
CREATE VIEW `current_members` AS SELECT s.id AS id_season, m.id, m.name, m. firstname, m.birth_date, m.email, m.phone_number, m.picture, m.city, ms.deposit  FROM members m, seasons s, memberships ms  WHERE ms.id_member=m.id and ms.id_season=s.id ORDER BY m.name, m.firstname;
CREATE VIEW `new_members` AS SELECT DISTINCT s.id AS id_season,m.id, m.name, m. firstname, m.birth_date, m.email, m.phone_number, m.picture, m.city, ms.deposit  FROM members m, seasons s, memberships ms WHERE ms.id_member=m.id and ms.id_season=s.id AND m.id NOT IN (SELECT m2.id from members m2, memberships ms2 WHERE m2.id=ms2.id_member and ms2.id_season=(ms.id_season-1)) ORDER BY m.name, m.firstname;
CREATE VIEW `games_borrows` AS SELECT b.id_season, g.id, g.name, COUNT(*) AS borrows_count FROM borrowings b,games g WHERE b.id_game=g.id GROUP BY b.id_season, g.id, g.name ORDER BY 4 DESC;
CREATE VIEW `members_borrows` AS SELECT b.id_season, m.id, m.name, m. firstname, COUNT(*) AS borrows_count FROM borrowings b, members m WHERE b.id_member=m.id GROUP BY b.id_season,m.id, m.name, m. firstname ORDER BY 5 DESC;
CREATE VIEW `total_borrows` AS SELECT id_season, COUNT(*) AS borrows_count from borrowings GROUP BY id_season;
CREATE VIEW `total_games_borrows` AS SELECT id_season, COUNT(DISTINCT id_game) AS borrows_count from borrowings GROUP BY id_season;

--
-- creation utilisateur pour le backend
--
--CREATE USER '---MYSQL_USER---'@'%' IDENTIFIED BY '---MYSQL_PASSWORD---';
--GRANT ALL PRIVILEGES ON ---MYSQL_DATABASE---.* TO '---MYSQL_USER---'@'%';

--
-- creation utilisateur admin de l'app
--
INSERT INTO `members`  (name,firstname,adress,postal_code,city,email,birth_date,phone_number,picture,admin_password,discord_tag,admin)
VALUES ("admin","admin"," ",0," ","admin","2000-01-01"," ","","$2b$10$NwwcU1auJ30hIs3oLvcVzesx/s6BczdjYJnWBp8bIUN7BN8qm0ey2","","1");