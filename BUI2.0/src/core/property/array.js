import Utils from "../common/utils";

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

methodsToPatch.forEach(function (method) {
    const original = arrayProto[method];

    Utils.def(arrayMethods, method,
        function (...args) {
            const result = original.apply(this, args);
            const ob = this.__ob__;

            let inserted = false;
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args
                    break
                case 'splice':
                    inserted = args.slice(2)
                    break
            }

            if (inserted) ob.observeArray(inserted);

            ob.dep.notify();

            return result;
        });
});

function protoAugment(target, src, keys) {
    target.__proto__ = src
}


function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i]
        Utils.def(target, key, src[key])
    }
}

export default function (value) {
    const augment = Utils.hasProto(value) ?
        protoAugment : copyAugment;

    augment(value, arrayMethods, arrayKeys);

}