function echoUtil {
  # @params text
  echo '-------------------------------------------'
  echo $1
  echo '-------------------------------------------'
}

# @params server container
function check_status {
  # @params server
  switchToServer $1
  cmd='mongo -u $MONGO_REPLICA_ADMIN -p $MONGO_PASS_REPLICA --eval "rs.status()" --authenticationDatabase "admin"'
  # @param container
  docker exec -i $2 bash -c "$cmd"
}

# @params master-server master-container
function load_user_and_mock_data {
  echoUtil "----> Add User and Mock data -- $1 $2"
  # @params master-server
  switchToServer $1
  # create the folder necessary for the container
  # @params master-container
  docker exec -i $2 bash -c 'mkdir /data/movies-service'
  # Copy files
  docker cp ./movies-service/src/config/user.js $2:/data/movies-service/
  docker cp ./movies-service/src/config/mockdb.js $2:/data/movies-service/
  # @params master-container
  docker exec -i $2 bash -c 'mongo < /data/movies-service/user.js'
  sleep 2
  # @params container
  docker exec -i $2 bash -c 'mongo < /data/movies-service/mockdb.js'
  sleep 3
  echoUtil "----> Completed User and Mock data -- $1 $2"
}

# @params master-server master-container replica-server
function add_replica {
  echoUtil "----> Add Replica -- $1 $2 $3"

  # @params master-server
  switchToServer $1

  # @params replica-server
  rs="rs.add('$3:27017')"
  add='mongo --eval "'$rs'" -u $MONGO_REPLICA_ADMIN -p $MONGO_PASS_REPLICA --authenticationDatabase="admin"'

  # @params master-container
  docker exec -i $2 bash -c "$add"
  sleep 2

  # @params replica-server
  wait_for_database $3
}

function addHostServers {
  arg=''

  for server in master1 worker11 worker12
  do
    cmd='docker-machine ip '$server
    arg=$arg' --add-host '${server}':'$($cmd)
  done

  echo $arg
}

# @params server
function wait_for_database {
  # @params server
  cmd='docker-machine ip '$1
  ip=$($cmd)
  port=27017

  echo "IP == $ip PORT == $port"
  start_ts=$(date +%s)
  while :
  do
    (echo > /dev/tcp/$ip/$port) >/dev/null 2>&1
    result=$?
    if [[ $result -eq 0 ]]; then
        end_ts=$(date +%s)
        echo "<<<<< $ip:$port is available after $((end_ts - start_ts)) seconds"
        sleep 3
        break
    fi
    sleep 5
  done
}

# @params container volume
function createContainer {
  env='./data/admin/env'
  servers=$(addHostServers)
  keyfile='/data/keyfile/mongo-keyfile'
  port='27017:27017'
  p='27017'
  rs='rs1'

  echo "Create container -- $1"

  # create container with security and replica
  # @params container volume
  docker run --restart=unless-stopped --name $1 --hostname $1 \
  -v $2:/data \
  --env-file $env \
  $servers \
  -p $port \
  -d mongo --smallfiles \
  --keyFile $keyfile \
  --replSet $rs \
  --storageEngine wiredTiger \
  --port $p
}

# @params volume
function createDockerVolume {
  echo "----> Create Docker Volume -- $1"
  # @params volume
  volumeExists=$(docker volume ls -q | grep $1)
  if [ "$volumeExists" == $1 ];
  then
    echo "volume available "$1
  else
    cmd='docker volume create --name '$1
    eval $cmd
  fi
  echo "<---- Complete Docker Volume -- $1"
}

# @params container volume
function configMongoDBContainer {
  echo "----> Config MongoDB Container -- $1 $2"

  # check if volume exists
  # @params volume
  createDockerVolume $2

  # start container
  # @params container volume
  docker run --name $1 -v $2:/data -d mongo --smallfiles
  sleep 2

  # create the folder necessary for the container
  # @params container
  docker exec -i $1 bash -c 'mkdir /data/keyfile /data/admin'

  # copy admin.js
  # @params container
  docker cp ./data/admin/admin.js $1:/data/admin/
  # copy replica.js
  # @params container
  docker cp ./data/admin/replica.js $1:/data/admin/
  # copy keyfile
  # @params container
  docker cp mongo-keyfile $1:/data/keyfile/

  # change folder owner to current container user
  # @params container
  docker exec -i $1 bash -c 'chown -R mongodb:mongodb /data'

  echo "------ Display folder data -------"
  docker exec -i $1 bash -c 'ls -ltr /data'

  echo "Remove container -- $1"
  # remove container
  # @params container
  docker rm -f $1
  echo "<---- Complete Config MongoDB Container -- $1 $2"
}

# @params server
function switchToServer {
  # @params server
  env='docker-machine env '$1
  echo "Switching To >>>> $1 Server"
  eval $($env)
}

# @params server container volume
function createMongoDBNode {
  echo "----> Create MongoDB Node -- $1 $2 $3"

  # swith to corresponding server
  # @params server
  switchToServer $1

  # config container
  # @params server container volume
  configMongoDBContainer $2 $3

  # @params container
  echo "Creating container >>>> "$2

  # create continer with security
  # @params container volume
  createContainer $2 $3
  sleep 2

  # verify if container is ready
  # @params server
  wait_for_database $1

  echo $1 $2 $3
  echo "<---- Completed MongoDB Node -- $1 $2 $3"
}

# @params name-of-keyfile
function createKeyFile {
  # @params name-of-keyfile
  openssl rand -base64 741 > $1
  chmod 600 $1
}

# @params master-server master-container
function init_replica_set {
  echo "----> Init Replica Set -- $1 $2"
  # swith to corresponding server
  # @params server
  switchToServer $1
  # @params container
  docker exec -i $2 bash -c 'mongo < /data/admin/replica.js'
  sleep 2
  # @params container
  docker exec -i $2 bash -c 'mongo < /data/admin/admin.js'
  sleep 3
  echo "<---- Completed Init Replica -- $1 $2"
}

# @params name-of-keyfile server container volume
function init_mongodb_primary {
  echoUtil "----> Init MongoDB Primary -- $1 $2 $3 $4"
  # @params name-of-keyfile
  createKeyFile $1
  # @params server container volume
  createMongoDBNode $2 $3 $4
  echoUtil "<---- Completed Init Primary -- $1 $2 $3 $4"
}

# @params server container volume
function init_mongodb_slave {
  echoUtil "----> Init MongoDB Slave -- $1 $2 $3"
  # @params server container volume
  createMongoDBNode $1 $2 $3
  echoUtil "<---- Completed Init Slave -- $1 $2 $3"
}

# @params server container
function removeContainer {
  echoUtil "----> Remove Container -- $1 $2"
  # @params server
  switchToServer $1
  # @params container
  docker rm -f $2
  docker volume rm $(docker volume ls -qf dangling=true)
  echoUtil "<---- Complete Remove Container -- $1 $2"
}

# @params -r (Reset/remove running containers)
function main {
  echo "param $1"
  if [ "-r" == $1 ];
  then
    removeContainer master1 mongoNode1
    removeContainer worker11 mongoNode2
    removeContainer worker12 mongoNode3
  fi

  #createDockerServer master1
  #createDockerServer worker11
  #createDockerServer worker12
  # @params keyfile server container volume
  init_mongodb_primary mongo-keyfile master1 mongoNode1 mongo_storage
  # @params server container volume
  init_mongodb_slave worker11 mongoNode2 mongo_storage
  # @params server container volume
  init_mongodb_slave worker12 mongoNode3 mongo_storage
  # @params master-server master-container
  init_replica_set master1 mongoNode1
  # @params master-server master-container replica-server
  add_replica master1 mongoNode1 worker11
  # @params master-server master-container replica-server
  add_replica master1 mongoNode1 worker12
  # @params master-server
  load_user_and_mock_data master1 mongoNode1
  # @params server container
  check_status master1 mongoNode1
}

main $1
