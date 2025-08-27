#!/bin/bash

# Script pour télécharger des images placeholder

cd backend/images

echo "Téléchargement des images de profils manquantes..."

# Images des membres (créer les manquantes avec des images placeholder simples)
for i in {3,23,24,25,26,27,28,29,30,31}; do
    if [ ! -f "member_$i.jpg" ]; then
        echo "Téléchargement de member_$i.jpg..."
        wget -q -O "member_$i.jpg" "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Membre+$i" || {
            echo "Échec pour member_$i, utilisation d'une image locale"
            cp placeholder-game.jpg "member_$i.jpg" 2>/dev/null || echo "Image par défaut"
        }
    fi
done

echo "Téléchargement des images de jeux..."

# Images des jeux
declare -A games=(
    ["catan.jpg"]="Catan"
    ["7wonders.jpg"]="7+Wonders"
    ["splendor.jpg"]="Splendor"
    ["azul.jpg"]="Azul"
    ["wingspan.jpg"]="Wingspan"
    ["scythe.jpg"]="Scythe"
    ["terraforming_mars.jpg"]="Terraforming+Mars"
    ["power_grid.jpg"]="Power+Grid"
    ["puerto_rico.jpg"]="Puerto+Rico"
    ["agricola.jpg"]="Agricola"
    ["pandemic.jpg"]="Pandemic"
    ["forbidden_island.jpg"]="Forbidden+Island"
    ["ghost_stories.jpg"]="Ghost+Stories"
    ["arkham_horror.jpg"]="Arkham+Horror"
    ["gloomhaven.jpg"]="Gloomhaven"
    ["spirit_island.jpg"]="Spirit+Island"
    ["mansions_madness.jpg"]="Mansions"
    ["dominion.jpg"]="Dominion"
    ["race_galaxy.jpg"]="Race+Galaxy"
    ["netrunner.jpg"]="Netrunner"
    ["mtg_commander.jpg"]="MTG"
    ["sushi_go.jpg"]="Sushi+Go"
    ["love_letter.jpg"]="Love+Letter"
    ["avalon.jpg"]="Avalon"
    ["ticket_ride.jpg"]="Ticket+Ride"
    ["king_tokyo.jpg"]="King+Tokyo"
    ["yahtzee.jpg"]="Yahtzee"
    ["monopoly.jpg"]="Monopoly"
    ["risk.jpg"]="Risk"
    ["carcassonne.jpg"]="Carcassonne"
    ["machi_koro.jpg"]="Machi+Koro"
    ["betrayal_house.jpg"]="Betrayal"
    ["arabian_nights.jpg"]="Arabian+Nights"
    ["sherlock_holmes.jpg"]="Sherlock"
    ["time_stories.jpg"]="TIME+Stories"
    ["twilight_struggle.jpg"]="Twilight"
    ["memoir44.jpg"]="Memoir+44"
    ["axis_allies.jpg"]="Axis+Allies"
    ["war_ring.jpg"]="War+Ring"
    ["hive.jpg"]="Hive"
    ["patchwork.jpg"]="Patchwork"
    ["chess.jpg"]="Chess"
    ["go.jpg"]="Go"
    ["othello.jpg"]="Othello"
    ["dixit.jpg"]="Dixit"
    ["codenames.jpg"]="Codenames"
    ["just_one.jpg"]="Just+One"
    ["wavelength.jpg"]="Wavelength"
    ["pictionary.jpg"]="Pictionary"
    ["charades.jpg"]="Charades"
    ["werewolf.jpg"]="Werewolf"
    ["resistance.jpg"]="Resistance"
    ["one_night_werewolf.jpg"]="Werewolf+Night"
    ["spyfall.jpg"]="Spyfall"
    ["telestrations.jpg"]="Telestrations"
    ["catan_seafarers.jpg"]="Catan+Sea"
    ["7wonders_duel.jpg"]="7W+Duel"
    ["wingspan_europe.jpg"]="Wingspan+EU"
    ["pandemic_legacy.jpg"]="Pandemic+Legacy"
)

for filename in "${!games[@]}"; do
    if [ ! -f "$filename" ]; then
        gamename="${games[$filename]}"
        echo "Téléchargement de $filename ($gamename)..."
        wget -q -O "$filename" "https://via.placeholder.com/400x300/059669/FFFFFF?text=$gamename" || {
            echo "Échec pour $filename, utilisation d'une image par défaut"
            cp placeholder-game.jpg "$filename" 2>/dev/null || echo "Image par défaut pour $filename"
        }
        sleep 0.1
    fi
done

echo "Téléchargement terminé !"
ls -la *.jpg | wc -l
echo "images téléchargées"