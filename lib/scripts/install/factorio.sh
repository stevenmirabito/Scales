#!/bin/bash

function checkResponseCode() {
    if [ $? -ne 0 ]; then
        echo -e "An error occurred while installing."
        exit 1
    fi
}

# Allows enough time for PufferPanel to get the Feed
sleep 5

username=root
base="/home/"
useDocker="false"

while getopts ":b:u:d" opt; do
    case "$opt" in
    b)
        base=$OPTARG
        ;;
    u)
        username=$OPTARG
        ;;
    d)
        useDocker="true"
        ;;
    esac
done
base=${base}/

if [ "${username}" == "root" ]; then
    echo "WARNING: Invalid Username Supplied."
    exit 1
fi;

shift $((OPTIND-1))

if [ ! -d "${base}${username}/public" ]; then
    echo "The home directory for the user (${base}${username}/public) does not exist on the system."
    exit 1
fi;

cd ${base}${username}/public
checkResponseCode

echo "installer:~$ rm -rf *"
rm -rf *
checkResponseCode

echo "installer:~$ stable_version=\`curl -s https://www.factorio.com/updater/get-available-versions | python -c \"import json,sys;obj=json.load(sys.stdin);version=[item.values()[0] for item in obj['core-linux_headless64'] if item.keys()[0] == 'stable'];print version[0];\"\`"
stable_version=`curl -s https://www.factorio.com/updater/get-available-versions | python -c "import json,sys;obj=json.load(sys.stdin);versions=[item.values()[0] for item in obj['core-linux_headless64'] if item.keys()[0] == 'stable'];print versions[0];"`
checkResponseCode

echo "installer:~$ curl -L -k -o factorio.tar.gz -O https://www.factorio.com/get-download/${stable_version}/headless/linux64"
curl -L -k -o factorio.tar.gz -O https://www.factorio.com/get-download/${stable_version}/headless/linux64
checkResponseCode

echo "installer:~$ tar -xzvf factorio.tar.gz && rm -rf factorio.tar.gz"
tar -xzvf factorio.tar.gz && rm -rf factorio.tar.gz
checkResponseCode

echo "installer:~$ mkdir -p factorio/saves"
mkdir -p factorio/saves
checkResponseCode

echo "installer:~$ cd ${base}${username}/public"
cd ${base}${username}/public
checkResponseCode

echo "installer:~$ chown -R ${username}:scalesuser *"
chown -R ${username}:scalesuser *
checkResponseCode

echo "installer:~$ exit 0"
exit 0
