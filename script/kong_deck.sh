# #!/bin/bash

# PING_SUCCESS = false

# while [!PING_SUCCESS]
# do

#   PING_SUCCESS = true
# done

#!/bin/bash
printf "%s" "waiting for ServerXY ..."
while ! timeout 0.2 ping -c 1 -n localhost:8001 &> /dev/null
do
    printf "%c" "."
done
printf "\n%s\n"  "Server is back online"