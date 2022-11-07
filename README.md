# FabricNetwork


Network Topology

Three Orgs(Peer Orgs)

    - Each Org have one peer(Each Endorsing Peer)
    - Each Org have separate Certificate Authority
    - Each Peer has Current State database as couch db


One Orderer Org

    - Three Orderers
    - One Certificate Authority



Steps:
Install Prerequisites :

Current Operating System is Linux (Ubuntu 20.04 64 bit) installed on Oracle VM Box 6.1

Git

Install the latest version of git if it is not already installed.

$ sudo apt-get install git

cURL

Install the latest version of cURL if it is not already installed.

$ sudo apt-get install curl

Docker

Install the latest version of Docker if it is not already installed.

sudo apt-get -y install docker-compose

Once installed, confirm that the latest versions of both Docker and Docker Compose executables were installed.

$ docker --version

Docker version 19.03.12, build 48a66213fe

$ docker-compose --version

docker-compose version 1.27.2, build 18f557f9

Make sure the Docker daemon is running.

sudo systemctl start docker

Optional: If you want the Docker daemon to start when the system starts, use the following:
sudo systemctl enable docker

Add your user to the Docker group.

sudo usermod -a -G docker <username>

Go

Install version 19.2 of Go if it is not already installed.
Remove any previous Go installation by deleting the /usr/local/go folder (if it exists), then extract the archive you just downloaded into /usr/local, creating a fresh Go tree in /usr/local/go:

    $ wget https://dl.google.com/go/go1.19.2.linux-amd64.tar.gz

    $ rm -rf /usr/local/go

    $ tar -xvzf go1.19.2.linux-amd64.tar.gz

    $ sudo mv go /usr/local

(You may need to run the command as root or through sudo).
Add /usr/local/go/bin to the PATH environment variable.

    sudo nano ~/.bashrc

    export GOROOT=/usr/local/go

    export PATH=$PATH:$GOROOT/bin:$PATH

    Note: Changes made to a profile file may not apply until the next time you log into your computer. To apply the changes immediately, just run the shell commands directly or execute them from the profile using a command such as source ~/.bashrc
Verify that you've installed Go by opening a command prompt and typing the following command:

    $ go version

Confirm that the command prints the installed version of Go.

Nodejs  & npm
    

    $ sudo apt update

    curl -sL https://deb.nodesource.com/setup_13.x | sudo bash -

    cat /etc/apt/sources.list.d/nodesource.list

    sudo apt-get install deb

    sudo apt-get update 

    deb https://deb.nodesource.com/node_13.x focal main

    sudo apt install nodejs npm


nodemon

    $ sudo npm install -g nodemon

Install Fabric Samples, Binaries, and Docker Images

    curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.1.1 1.4.7 0.4.20

if you got permission denied error run this command

    sudo chmod 666 /var/run/docker.sock
Add bin path (pathe where you unstalled the fabric-samples) to the PATH environment variable.

    sudo nano ~/.bashrc
    
    export PATH=$PATH:/home/ala/fabric-samples/bin
    
    source ~/.bashrc

Steps to set up the network and test the Chaincode:
1.	Clone the repo
2.	Run Certificates Authority Services for all Orgs 
    $cd artifacts/channel/create-certificate-with-ca
    $ docker-compose up -d 
3.	Create Cryptomaterials for all organizations
    $ ./create-certificate-with-ca.sh

4. Create Channel Artifacts 
    $cd artifacts/channel
    $ ./create-artifacts.sh
    $ cd artifacts
    $ docker-compose up -d 
5.	Create Channel and join peers (file in main directory)
    $ ./createChannel.sh
6.	Deploy Chaincode (file in main directory)
    $ ./deployChaincode.sh
7.	Create Connection Profiles
    $ cd api-2.0/config
    $ ./generate-ccp.sh
8.	Start API Server
    $ cd api-2.0
    $ npm install
    $ nodemon app.js






Use the postman link to import the collection and invoke Chaincode.
The steps to complete full transaction in the system are: 
1.	Register Seller
2.	Create Parcel 
3.	Register Customer
4.	Create Agreement 
5.	Create Order
6.	Register Courier #1
7.	Create Bid (by courier #1)
8.	Submit Bid (by courier #1)
9.	Register #2
10.	Create Bid (by courier #2)
11.	Submit Bid (by courier #2)
12.	Close Order Bid (by seller)
13.	Reveal Bid (by Courier #1)
14.	Reveal Bid (by Courier #2)
15.	Assign Courier (by Seller)
16.	Courier Arrived (by assigned Courier)
17.	Out for delivery (by seller)
18.	Handover (by courier)
19.	Receive Parcel (by customer)
20.	Complete Order (by seller)

Link to Couchdb is :
Org1 (Sellers)
127.0.0.1:5984/_utils/#
Org2 (Customers)
127.0.0.1:6984/_utils/#
Org3 (Couriers)
127.0.0.1:7984/_utils/#
Username :admin
Password: adminpw
