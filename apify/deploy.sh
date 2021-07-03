#!/usr/bin/env bash
set -e

npx apify-cli login --token $APIFY_TOKEN

# Etsy deployment
cd apify/search-feed && npx apify-cli push 