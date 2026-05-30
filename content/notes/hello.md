---
title: "Hello!"
date: 2026-05-30
tags:
  - personal
draft: false
---

# Hello!

Sebuah awal yang baru.

![Hello!](https://images.unsplash.com/photo-1500576992153-0271099def59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDF8fGhlbGxvfGVufDB8fHx8MTY5Mzc0NDU3MHww&ixlib=rb-4.0.3&q=80&w=960)

Ini adalah website baru untuk menggantikan website sebelumnya yang menggunakan [Hugo](https://gohugo.io/). Karena website sebelumnya bermasalah dengan SEO dan sulit untuk di index Google, jadi saya memutuskan untuk menggantinya dengan [Ghost](https://ghost.org/).

Website ini nantinya akan diisi dengan berbagai tulisan yang berkaitan dengan jaringan, pemrograman, dan IoT. Serta berbagai project yang sedang saya kerjakan.

Website ini di hosting menggunakan server lokal berupa [STB HG680P](https://www.google.com/search?q=stb+hg680p&ref=blog.rizkyfauzan.id) yang diinstal dengan [Armbian Server](https://github.com/ophub/amlogic-s9xxx-armbian) dan agar bisa diakses dari internet saya menggunakan [fatedier/frp](https://github.com/fatedier/frp) sebagai reverse proxy. Server [reverse proxy](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/) berada di Amerika Serikat menggunakan virtual machine dari Microsoft Azure.

Update (16/10/2023):  
Saya beralih menggunakan IP publik dan menggunakan [Traefik](https://github.com/traefik/traefik) sebagai [reverse proxy](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/). Karena jika menggunakan [fatedier/frp](https://github.com/fatedier/frp) dan server di Amerika Serikat memiliki latensi yang cukup tinggi. Saya menggunakan 2 IP publik dari 2 ISP melalui koneksi [VPN L2TP](https://en.wikipedia.org/wiki/Layer_2_Tunneling_Protocol). Dan menggunakan [Cloudflare Proxied DNS](https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/) agar lebih aman dan lebih cepat. Karena IP publik mengarah secara langsung ke router di home server saya.

Update (30/05/2026):  
Saya migrasikan blog dari [Ghost](https://ghost.org/) ke [Quartz v5](https://quartz.jzhao.xyz/) — static site generator berbasis markdown. Seluruh artikel dari `blog.rizkyfauzan.id` sudah dipindahkan dan digabungkan ke [notes.rizkyfauzan.id](https://notes.rizkyfauzan.id) agar lebih terpusat. Hosting juga saya pindahkan ke [Cloudflare Pages](https://pages.cloudflare.com/) dengan deployment otomatis dari GitHub, sehingga tidak perlu lagi mengelola server sendiri untuk website ini.