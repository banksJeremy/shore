#!/usr/bin/env sh
# wgets MathJax to the correct path
# not really tested

wget http://sourceforge.net/projects/mathjax/files/MathJax/v1.0.1/MathJax-v1.0.1a.zip/download &&
unzip MathJax-v1.0.1a.zip &&
mv MathJax/* mathjax-1.0.1 &&
rm MathJax-v1.0.1a.zip &&
rm -rf MathJax
