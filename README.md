# React-Static - Blank Template

To use this template, run `react-static create` and select the `blank` template.



# Example build node server

npm run build
nginx  -c ./build_node_nginx_dev.conf -p .



# docker?


docker run \
    -it \
    --rm \
    -v ${PWD}:/app \
    -v /app/node_modules \
    -p 3001:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    sample:dev