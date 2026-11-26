---
title: "Cara Membuat VM Template Ubuntu 22.04 di Proxmox Dengan Cloud Init"
date: 2024-04-17
description: "Langkah membuat VM template Ubuntu 22.04 di Proxmox dengan cloud-init."
lang: id
tags:
  - proxmox
  - ubuntu
  - cloud-init
  - virtualization
draft: false
---
# Cara Membuat VM Template Ubuntu 22.04 di Proxmox Dengan Cloud Init

![Cara Membuat VM Template Ubuntu 22.04 di Proxmox Dengan Cloud Init](/images/proxmox-cloud-init-cover.webp)

SSH ke pve dengan user root

Buat folder cloud-images
    
    
    mkdir cloud-images

Pindah ke folder cloud-images
    
    
    cd cloud-images

Download image

Link image: [https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img](https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img)
    
    
    wget https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img

Install libguestfs-tools
    
    
    apt install libguestfs-tools -y

Install qemu-agent di image
    
    
    virt-customize -a jammy-server-cloudimg-amd64.img --install qemu-guest-agent --truncate /etc/machine-id

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-1.webp)

Resize image
    
    
    qemu-img resize jammy-server-cloudimg-amd64.img 32G

Buat VM baru di proxmox

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-2.webp)

Pilih do not use any media

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-3.webp)

Centang qemu agent

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-4.webp)

Hapus semua disk yang ada

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-5.webp)

Setting CPU

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-6.webp)

Setting memory

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-7.webp)

Setting network

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-8.webp)

Confirm

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-9.webp)

Import disk ke vm yang telah dibuat
    
    
    qm disk import 2000 jammy-server-cloudimg-amd64.img local-lvm

Masuk ke VM hardware

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-10.webp)

Klik 2x pada Unused Disk 0 lalu klik Add

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-11.webp)

Masuk ke VM options lalu klik 2x pada Boot Order

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-12.webp)

Naikkan scsi0 ke paling atas dan dicentang lalu klik OK

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-13.webp)

Masuk ke VM Hardware klik add lalu pilih Cloudinit Drive

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-14.webp)

Konfigurasi sebagai berikut lalu klik Add

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-15.webp)

Klik kanan pada VM lalu klik Convert to template

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-16.webp)

Klik YES

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-17.webp)

Klik kanan pada VM lalu klik Clone

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-18.webp)

Beri nama dan pilih full clone lalu klik Clone

![](/images/blog-cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init-19.webp)