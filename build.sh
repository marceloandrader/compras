#!/bin/bash

rm -rf dist && BROCCOLI_ENV=production broccoli build dist
