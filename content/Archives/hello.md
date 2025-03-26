---
title: Hello!
draft: false
tags:
  - Archives
---
Ini adalah website baru untuk menggantikan website sebelumnya yang menggunakan [Hugo](https://gohugo.io/). Karena website sebelumnya bermasalah dengan SEO dan sulit untuk di index Google, jadi saya memutuskan untuk menggantinya dengan [Ghost](https://ghost.org/).

Website ini nantinya akan diisi dengan berbagai tulisan yang berkaitan dengan jaringan, pemrograman, dan IoT. Serta berbagai project yang sedang saya kerjakan.

Website ini di hosting menggunakan server lokal berupa STB [HG680P](https://www.google.com/search?q=stb+hg680p) yang diinstal dengan [Armbian](https://github.com/ophub/amlogic-s9xxx-armbian) Server dan agar bisa diakses dari internet saya menggunakan [fatedier/frp](https://github.com/fatedier/frp) sebagai reverse proxy. Server [reverse proxy](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/) berada di Amerika Serikat menggunakan virtual machine dari Microsoft Azure.

## Update (16/10/2023)

Saya beralih menggunakan IP publik dan menggunakan [Traefik](https://github.com/traefik/traefik) sebagai [reverse proxy](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/). Karena jika menggunakan [fatedier/frp](https://github.com/fatedier/frp) dan server di Amerika Serikat memiliki latensi yang cukup tinggi. Saya menggunakan 2 IP publik dari 2 ISP melalui koneksi [VPN L2TP](https://en.wikipedia.org/wiki/Layer_2_Tunneling_Protocol). Dan menggunakan [Cloudflare Proxied DNS](https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/) agar lebih aman dan lebih cepat. Karena IP publik mengarah secara langsung ke router di home server saya.
