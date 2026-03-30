#!/bin/bash

devices=($(adb devices | grep -w "device" | awk '{print $1}'))
if [ ${#devices[@]} -eq 0 ]; then
    echo "No devices connected."
    exit 1
fi

echo "Connected devices:"
select device in "${devices[@]}"; do
    if [ -n "$device" ]; then
        sanitized_device=$(echo "$device" | tr ')' '-----')
        echo "You selected device: $sanitized_device"
        echo "Running 'adb -s $device  reverse tcp:8081 tcp:8081"
        adb -s "$device" reverse tcp:8081 tcp:8081
        
        break
    else
        echo "Invalid selection, please try again."
    fi
done
