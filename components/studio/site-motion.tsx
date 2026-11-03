'use client';
import {useEffect} from 'react';
import {startSiteMotion} from '../../lib/motion';
export default function SiteMotion(){useEffect(()=>startSiteMotion(document.querySelector<HTMLElement>('.public-site main')||document.body),[]);return null;}
