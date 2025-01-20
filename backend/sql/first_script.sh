echo "Updating sql script"

sed -i "s/---MYSQL_DATABASE---/$MYSQL_DATABASE/g" /docker-entrypoint-initdb.d/initialize.sql
sed -i "s/---MYSQL_USER---/$MYSQL_USER/g" /docker-entrypoint-initdb.d/initialize.sql
sed -i "s/---MYSQL_PASSWORD---/$MYSQL_PASSWORD/g" /docker-entrypoint-initdb.d/initialize.sql
