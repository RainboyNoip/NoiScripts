#!/bin/env python3
# 作用
# 展示输入文件INPUT 的内容 并输出 程序1 说程序2 的运行结果

import argparse
import os

parser = argparse.ArgumentParser(description="展示,对比")
parser.add_argument("-o","--org",help="原始程序,不保证正确,默认 1",default="1")
parser.add_argument("-r","--right",help="对拍程序,保证正确,默认 2",default="2")
parser.add_argument("-i","--in",help="输入的数据,默认 INPUT ",default="INPUT")
parser.add_argument("-w","--width",help="diff 显示宽度,默认 50",default="50")
args = vars(parser.parse_args())
print("="*20)
os.system("cat {}".format(args["in"]))
print("="*20)
os.system("./{org} < {in} > 1.out".format(**args))
os.system("./{right} < {in} > 2.out".format(**args))
print("\n")
os.system("diff -W {width} -y 1.out 2.out | colordiff".format(**args))
